using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = "";
        public int? ManagerId { get; set; }

    }
}