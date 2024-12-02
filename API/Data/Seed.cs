using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    private static JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
    public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        await AddRolesToManagerAsync(roleManager, GetRoles());

        await AddUsersToManagerAsync(userManager, await GetUsersAsync());
    }

    private static IEnumerable<AppRole> GetRoles()
    {
        return new List<AppRole>
        {
            new() { Name = "Member" },
            new() { Name = "Admin" },
            new() { Name = "Moderator" }
        };
    }

    private static async Task AddRolesToManagerAsync(RoleManager<AppRole> roleManager, IEnumerable<AppRole> roles)
    {
        foreach (var role in roles)
        {
            await roleManager.CreateAsync(role);
        }
    }

    private static async Task AddUsersToManagerAsync(UserManager<AppUser> userManager, IEnumerable<AppUser> users)
    {

        foreach (var user in users)
        {
            user.UserName = user.UserName!.ToLower();
            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Member");
        }

        var admin = new AppUser
        {
            UserName = "admin",
            KnownAs = "Admin",
            Gender = "",
            City = "",
            Country = ""
        };

        await userManager.CreateAsync(admin, "Pa$$w0rd");
        await userManager.AddToRolesAsync(admin, [ "Admin", "Moderator" ]);
    }

    private static async Task<IEnumerable<AppUser>> GetUsersAsync()
    {
        var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");

        return JsonSerializer.Deserialize<List<AppUser>>(userData, _jsonOptions) ?? [];
    }
}
