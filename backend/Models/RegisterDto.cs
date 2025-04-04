namespace API.Models
{
    public class RegisterDto
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int RoleId { get; set; }
    }
}