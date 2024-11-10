using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");

        /// the "using" will release the current instance of the HMACSHA512 we're creating
        /// This means that the instance will be disposed when we'vefinished using it
        /// We can omits the "using" and let the garbage collector do it but we have no control of it and so we don't know when the disposing will be done
        /// The usage of "using" is a better solution
        using var hmac = new HMACSHA512();

        var user = mapper.Map<AppUser>(registerDto);
        
        user.UserName = registerDto.Username.ToLower();
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
        user.PasswordSalt = hmac.Key;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return new UserDto
        {
            Username = user.UserName,
            Token = tokenService.CreateToken(user),
            KnownAs = user.KnownAs
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.UserName == loginDto.Username.ToLower());

        if (user is null) return Unauthorized("Invalid username");

        using var hmac = new HMACSHA512(user.PasswordSalt);

        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        if(!HashIsValid(user.PasswordHash, computedHash)) return Unauthorized("Invalid password");

        return new UserDto
        {
            Username = user.UserName,
            KnownAs = user.KnownAs,
            Token = tokenService.CreateToken(user),
            PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url
        };
    }

    private bool HashIsValid(byte[] expectedHash, byte[] actualHash)
    {
        for (int i = 0; i < expectedHash.Length; i++)
        {
            if (expectedHash[i] != actualHash[i]) return false;
        }
        return true;
    }

    private async Task<bool> UserExists(string username)
    {
        return await context.Users.AnyAsync(u => u.UserName.ToLower() == username.ToLower());
    }
}
