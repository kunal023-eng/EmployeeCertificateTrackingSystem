using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CertificationController(ApplicationContext _context) : ControllerBase
    {
        [HttpGet("GetAllCertifications")]
        public async Task<IActionResult> GetAllCertifications()
        {
            var certifications = await _context.Certifications.ToListAsync();
            if (certifications == null)
            {
                return NotFound();
            }
            return Ok(certifications);
        }

        [HttpPost("AddCertification")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCertification(Certification cert)
        {
            if (cert.Name == "" || cert.Amount < 0)
            {
                return BadRequest("Invalid data");
            }
            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpDelete("DeleteCertifications")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCertifications([FromBody] DeleteCertificationsRequest request)
        {
            if (request?.Ids == null || request.Ids.Count == 0)
                return BadRequest("No certification IDs provided.");

            var certifications = await _context.Certifications
                .Where(c => request.Ids.Contains(c.CertificationId))
                .ToListAsync();

            if (certifications.Count == 0)
                return NotFound("No certifications found for the given IDs.");

            _context.Certifications.RemoveRange(certifications);
            await _context.SaveChangesAsync();

            return Ok(certifications);
        }

        public class DeleteCertificationsRequest
        {
            public List<int> Ids { get; set; } = [];
        }

    }
}