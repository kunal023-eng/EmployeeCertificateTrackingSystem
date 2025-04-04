using API.Entities;
using API.Models;

namespace API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> RegisterAsync(RegisterDto request);
        Task<LoginResponseDto?> LoginAsync(LoginDto request);
        Task<Employee?> GetEmployeeByIdAsync(int employeeId);
        LoginResponseDto? VerifyToken(TokenVerificationDto token);
        Task<Employee?> UpdateEmployeeAsync(int employeeId, int? roleId, int? departmentId);
        Task<List<Employee>?> GetAllEmployeesAsync();
        Task<Employee?> DeleteEmployeeAsync(int employeeId);
    }
}