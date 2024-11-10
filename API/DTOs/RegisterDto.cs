using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(100)]
    [StringLength(32, MinimumLength = 5)]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string Gender { get; set; } = string.Empty;
    [Required]
    public string DateOfBirth { get; set; } = string.Empty;
    [Required]
    public string KnownAs { get; set; } = string.Empty;
    [Required]
    public string City { get; set; } = string.Empty;
    [Required]
    public string Country { get; set; } = string.Empty;
    [Required]
    [StringLength(32, MinimumLength = 10)]
    public string Password { get; set; } = string.Empty;
}
