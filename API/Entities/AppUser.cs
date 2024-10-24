using System;

namespace API.Entities;

public class AppUser
{
    public int Id { get; set; }
    public required string UserName { get; set; } // the required modifier make our property required so it can't be null and we don't have to pass it an initial value
    public required byte[] PasswordHash { get; set; }
    public required byte[] PasswordSalt { get; set; }
}
