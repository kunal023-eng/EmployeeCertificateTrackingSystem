using API.Data;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Mvc;

namespace API.Services
{
    public class AuthService(ApplicationContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<LoginResponseDto?> RegisterAsync(RegisterDto request)
        {
            if (await context.Employees.AnyAsync(x => x.Email == request.Email))
            {
                return null;
            }

            var EmployeeRoleId = await context.Roles.FirstOrDefaultAsync(x => x.RoleName == "Employee");
            if (EmployeeRoleId == null)
            {
                return null;
            }

            var employee = new Employee
            {
                Name = request.Name,
                Email = request.Email,
                DepartmentId = request.DepartmentId,
                RoleId = EmployeeRoleId.RoleId,
            };

            var hashPwd = new PasswordHasher<Employee>().HashPassword(employee, request.Password);
            employee.Password = hashPwd;

            context.Employees.Add(employee);
            await context.SaveChangesAsync();

            var token = GenerateToken(employee);
            return new LoginResponseDto
            {
                Token = token,
                EmployeeId = employee.EmployeeId,
            };
        }
        public async Task<LoginResponseDto?> LoginAsync(LoginDto request)
        {
            var employee = await context.Employees.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (employee == null)
            {
                return null;
            }
            if (new PasswordHasher<Employee>().VerifyHashedPassword(employee, employee.Password, request.Password) == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var token = GenerateToken(employee);

            return new LoginResponseDto
            {
                Token = token,
                EmployeeId = employee.EmployeeId,
            };
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int employeeId)
        {
            var Employee = await context.Employees
            .Include(x => x.Role)
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId);

            return Employee;
        }

        //verify token
        public LoginResponseDto? VerifyToken([FromBody] TokenVerificationDto request)
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return null;
            }

            var principal = ValidateToken(request.Token);
            if (principal != null)
            {
                var EmployeeId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (EmployeeId == null) return null;
                return new LoginResponseDto
                {
                    Token = request.Token,
                    EmployeeId = int.Parse(EmployeeId)
                };
            }

            return null;
        }

        public async Task<Employee?> UpdateEmployeeAsync(int employeeId, int? roleId, int? departmentId)
        {
            var employee = await context.Employees.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
            if (employee == null) return null;

            // Validate manager uniqueness
            if (roleId == 2 || (roleId == null && employee.RoleId == 2))
            {
                var deptId = departmentId ?? employee.DepartmentId;
                var existingManager = await context.Employees
                    .AnyAsync(e => e.RoleId == 2 && e.DepartmentId == deptId && e.EmployeeId != employeeId);

                if (existingManager)
                {
                    return null;
                }
            }

            if (roleId.HasValue && roleId.Value != 0)
            {
                employee.RoleId = roleId.Value;
            }

            if (departmentId.HasValue && departmentId.Value != 0)
            {
                employee.DepartmentId = departmentId.Value;
            }

            context.Employees.Update(employee);
            await context.SaveChangesAsync();
            return employee;
        }

        public async Task<List<Employee>?> GetAllEmployeesAsync()
        {
            var Employees = await context.Employees
            .Include(x => x.Role)
            .Include(x => x.Department)
            .ToListAsync();
            if (Employees == null) return null;
            return Employees;
        }

        public async Task<Employee?> DeleteEmployeeAsync(int employeeId)
        {
            var employee = await context.Employees.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
            if (employee == null) return null;
            context.Employees.Remove(employee);
            await context.SaveChangesAsync();
            return employee;
        }

        private string GenerateToken(Employee employee)
        {
            var role = context.Roles.FirstOrDefault(r => r.RoleId == employee.RoleId);
            if (role == null)
            {
                throw new Exception("Role not found");
            }
            string roleName = role?.RoleName.ToString() ?? "Employee";

            var claims = new List<Claim>{
                new Claim(ClaimTypes.Name, employee.Email),
                new Claim(ClaimTypes.NameIdentifier, employee.EmployeeId.ToString()),
                new Claim(ClaimTypes.Role, roleName)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );


            var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

            return token;
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration.GetValue<string>("AppSettings:Issuer"),
                    ValidAudience = configuration.GetValue<string>("AppSettings:Audience"),
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!))
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }

    }
}