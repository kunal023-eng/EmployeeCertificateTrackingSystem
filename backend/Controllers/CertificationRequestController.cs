using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificationRequestController(ApplicationContext _context, IEmailService emailService) : ControllerBase
    {

        [HttpPost("CreateRequest")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> CreateRequest([FromForm] CertificationRequestDTO requestDTO, List<IFormFile> files)
        {
            if (requestDTO == null) return BadRequest("Request body is null");

            var employee = await _context.Employees.FirstOrDefaultAsync(x => x.EmployeeId == requestDTO.EmployeeId);
            if (employee == null) return BadRequest("Employee not found");

            var certification = await _context.Certifications.FirstOrDefaultAsync(x => x.CertificationId == requestDTO.CertificationId);
            if (certification == null) return BadRequest("Certification not found");

            var employeeRequests = await _context.CertificationRequests
                .Include(r => r.Certification)
                .Where(r => r.EmployeeId == requestDTO.EmployeeId)
                .ToListAsync();

            // Check if the employee has already submitted a request for the same certification
            if (employeeRequests.Any(r => r.CertificationId == requestDTO.CertificationId))
            {
                return BadRequest("You have already submitted a request for this certification");
            }

            string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            // Ensure the directory exists
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            List<string> fileUrls = new();

            try
            {
                fileUrls = AddFiles(files);

                var request = new CertificationRequest()
                {
                    EmployeeId = requestDTO.EmployeeId,
                    CertificationId = requestDTO.CertificationId,
                    Employee = employee,
                    Certification = certification,
                    DocumentURLs = fileUrls
                };

                _context.CertificationRequests.Add(request);
                await _context.SaveChangesAsync();

                //send email in different thread
                _ = Task.Run(() =>
                    emailService.SendEmailAsync(employee.Email, "Certification Request",
                    "Your request has been submitted successfully."))
                    .ContinueWith(t =>
                    {
                        if (t.IsFaulted)
                        {
                            // Log any errors
                            Console.WriteLine($"Email sending failed: {t.Exception?.Message}");
                        }
                    });

                return Ok(new { message = "Request submitted successfully", documentUrls = fileUrls });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading files: {ex.Message}");

                // Rollback in case of failure
                foreach (var filePath in fileUrls)
                {
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }

                return StatusCode(500, "An error occurred while uploading files. Please try again.");
            }
        }

        [HttpPut("updateRequest")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> UpdateRequest([FromForm] int requestId, List<IFormFile> files)
        {
            var request = await _context.CertificationRequests.FirstOrDefaultAsync(x => x.RequestId == requestId);
            if (request == null) return BadRequest("Request not found");

            var fileUrls = AddFiles(files);

            request.DocumentURLs = fileUrls;
            if (request.ManagerSettledStatus == "Reverted") request.ManagerSettledStatus = "Pending";
            if (request.HrSettledStatus == "Reverted") request.HrSettledStatus = "Pending";

            _context.CertificationRequests.Update(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Request updated successfully", documentUrls = fileUrls });

        }


        //-----------------------------------------------Get Requests by EmployeeID --------------------------------------------------
        [HttpGet("GetEmployeeRequests/{employeeId}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetEmployeeRequests(int employeeId)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
            if (employee == null) return BadRequest("Employee not found");
            var employeeRequests = await _context.CertificationRequests
                .Include(r => r.Certification)
                .Include(r => r.Manager)
                .Include(r => r.Hr)
                .Where(r => r.EmployeeId == employeeId)
                .ToListAsync();
            if (employeeRequests == null) return NotFound("No requests found");
            return Ok(employeeRequests);
        }

        //-----------------------------------------------Get All Requests --------------------------------------------------
        [HttpGet("GetAllRequests")]
        [Authorize(Roles = "Manager,HR,Admin")]
        public async Task<IActionResult> GetAllRequests()
        {
            var allRequests = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Manager)
                .Include(r => r.Hr)
                .Include(r => r.Certification)
                .ToListAsync();
            if (allRequests == null) return NotFound("No requests found");
            return Ok(allRequests);
        }

        [HttpGet("GetPendingRequestsForManager/{departmentId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> GetPendingRequestsForManager(int departmentId)
        {
            var pendingRequests = await _context.CertificationRequests
            .Include(r => r.Employee)
            .Include(r => r.Manager)
            .Include(r => r.Hr)
            .Include(r => r.Certification)
            .Where(r => r.ManagerSettledStatus == "Pending")
            .ToListAsync();

            var filteredRequests = pendingRequests
                .Where(r => r.Employee?.DepartmentId == departmentId)
                .ToList();

            if (!filteredRequests.Any()) return NotFound("No pending requests found");

            return Ok(filteredRequests);

        }
        [HttpGet("GetPendingRequestsForHr")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> GetPendingRequestsForHr()
        {
            var pendingRequests = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Manager)
                .Include(r => r.Hr)
                .Include(r => r.Certification)
                .Where(r => r.HrSettledStatus == "Pending" && r.ManagerSettledStatus == "Approved")
                .ToListAsync();
            if (pendingRequests == null) return NotFound("No pending requests found");
            return Ok(pendingRequests);
        }

        [HttpPost("SettledRequestManager")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> SettledRequestManager(SettledDto settledDto)
        {
            var request = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Hr)
                .Include(r => r.Manager)
                .Include(r => r.Certification)
                .FirstOrDefaultAsync(r => r.RequestId == settledDto.RequestId);
            if (request == null) return NotFound("Request not found");


            request.ManagerSettledDate = DateTime.UtcNow;
            request.ManagerComment = settledDto.Comment ?? "";
            request.ManagerId = settledDto.EmployeeId;
            if (settledDto.SettledType == "Reverted") request.Attempts++;
            if (settledDto.SettledType == "Approved") request.Attempts = 1;
            if (request.Attempts > 3)
            {
                request.ManagerSettledStatus = "Rejected";
                request.HrSettledStatus = "Rejected";
            }
            else
            {
                request.ManagerSettledStatus = settledDto.SettledType;
            }
            await _context.SaveChangesAsync();
            request = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Hr)
                .Include(r => r.Manager)
                .Include(r => r.Certification)
                .FirstOrDefaultAsync(r => r.RequestId == settledDto.RequestId);

            if (request == null) return NotFound("Request not found");
            if (request.Employee != null)
            {

                _ = Task.Run(() =>
                        emailService.SendEmailAsync(request.Employee.Email, "Certification Request " + settledDto.SettledType,
                        "Your request has been " + settledDto.SettledType + " by the manager"))
                        .ContinueWith(t =>
                        {
                            if (t.IsFaulted)
                            {
                                // Log any errors
                                Console.WriteLine($"Email sending failed: {t.Exception?.Message}");
                            }
                        });
            }

            return Ok(request);
        }

        [HttpPost("SettledRequestHr")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> SettledRequestHr(SettledDto settledDto)
        {
            var request = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Hr)
                .Include(r => r.Manager)
                .Include(r => r.Certification)
                .FirstOrDefaultAsync(r => r.RequestId == settledDto.RequestId);
            if (request == null) return NotFound("Request not found");

            request.HrSettledDate = DateTime.UtcNow;
            request.HrComment = settledDto.Comment ?? "";
            request.HrId = settledDto.EmployeeId;
            if (settledDto.SettledType == "Reverted") request.Attempts++;
            if (request.Attempts > 3) request.HrSettledStatus = "Rejected";
            else
            {
                request.HrSettledStatus = settledDto.SettledType;
            }
            await _context.SaveChangesAsync();
            request = await _context.CertificationRequests
                .Include(r => r.Employee)
                .Include(r => r.Hr)
                .Include(r => r.Manager)
                .Include(r => r.Certification)
                .FirstOrDefaultAsync(r => r.RequestId == settledDto.RequestId);
            
            if (request == null) return NotFound("Request not found");
            if (request.Employee != null)
            {

                _ = Task.Run(() =>
                        emailService.SendEmailAsync(request.Employee.Email, "Certification Request " + settledDto.SettledType,
                        "Your request has been " + settledDto.SettledType + " by the HR"))
                        .ContinueWith(t =>
                        {
                            if (t.IsFaulted)
                            {
                                // Log any errors
                                Console.WriteLine($"Email sending failed: {t.Exception?.Message}");
                            }
                        });
            }
            return Ok(request);
        }

        public List<string> AddFiles(List<IFormFile> files)
        {
            List<string> fileNames = new List<string>();
            foreach (var file in files)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                fileNames.Add(fileName);
            }
            return fileNames;
        }
        [HttpGet("file/{fileName}")]
        public IActionResult GetPdf(string fileName)
        {
            string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            string filePath = Path.Combine(uploadPath, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/pdf", fileName);
        }

    }
}
