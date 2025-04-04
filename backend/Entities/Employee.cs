using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }

        public Role? Role { get; set; }
        public Department? Department { get; set; }

    }
}