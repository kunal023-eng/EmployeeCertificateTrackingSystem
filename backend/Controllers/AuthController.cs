using API.Entities;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<ActionResult<Employee>> Register(RegisterDto body)
        {
            if (body == null)
            {
                return BadRequest("Request body is null");
            }
            var user = await authService.RegisterAsync(body);
            if (user == null)
            {
                return BadRequest("User already exists");
            }

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto body)
        {
            if (body == null)
            {
                return BadRequest("Request body is null");
            }
            var response = await authService.LoginAsync(body);
            if (response == null)
            {
                return BadRequest("Invalid credentials");
            }

            return Ok(response);
        }

        [HttpPut("update")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Employee>> UpdateEmployee([FromBody] EmployeeUpdateRequest request)
        {
            if (request == null || request.EmployeeId == 0)
            {
                return BadRequest("Invalid request data");
            }

            var response = await authService.UpdateEmployeeAsync(request.EmployeeId, request.RoleId, request.DepartmentId);

            if (response == null)
            {
                return BadRequest("Invalid credentials");
            }

            return Ok(response);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Manager,HR")]
        public async Task<ActionResult<Employee>> GetAllEmployees()
        {
            var response = await authService.GetAllEmployeesAsync();
            if (response == null) return BadRequest("No employees found");
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LoginResponseDto>> GetEmployeeById(int id)
        {
            var response = await authService.GetEmployeeByIdAsync(id);
            if (response == null)
            {
                return BadRequest("Invalid credentials");
            }
            return Ok(response);
        }
        [HttpPost("verifyToken")]
        public ActionResult<LoginResponseDto> VerifyToken([FromBody] TokenVerificationDto request)
        {
            if (request == null)
            {
                return BadRequest("Request body is null");
            }
            return Ok(authService.VerifyToken(request));
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> DeleteEmployee(int id)
        {
            var response = await authService.DeleteEmployeeAsync(id);
            return Ok(response);
        }

        public class EmployeeUpdateRequest
        {
            public int EmployeeId { get; set; }
            public int? RoleId { get; set; }
            public int? DepartmentId { get; set; }
        }

    }
}