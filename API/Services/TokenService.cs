using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService(IConfiguration config, UserManager<AppUser> userManager) : ITokenService
{
    public async Task <string> CreateToken(AppUser user)
    {
        string tokenKey = config["TokenKey"] ?? throw new Exception("Cannot access 'TokenKey' from appsettings");
        if (tokenKey.Length < 64)
        {
            throw new Exception("Your token key need to be longer than 64 characters");
        }

        SymmetricSecurityKey key = GetSymetricKey(tokenKey);

        if (user.UserName is null) throw new Exception("No username found for user");

        List<Claim> claims = await GetTokenClaims(userManager, user);

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    private SymmetricSecurityKey GetSymetricKey(string key)
    {
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)); // this means that the same key will be used to encrypt and decrypt
    }

    private static async Task<List<Claim>> GetTokenClaims(UserManager<AppUser> userManager, AppUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName!)
        };

        var roles = await userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }
}
