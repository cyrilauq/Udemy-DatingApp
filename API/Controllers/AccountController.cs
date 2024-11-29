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
        var user = mapper.Map<AppUser>(registerDto);
        
        context.Users.Add(user);
        await context.SaveChangesAsync();

        
        if (user.UserName is null) return BadRequest("No username found for the user");

        return new UserDto
        {
            Username = user.UserName,
            Token = tokenService.CreateToken(user),
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.UserName == loginDto.Username.ToLower());

        if (user is null || user.UserName is null) return Unauthorized("Invalid username");

        return new UserDto
        {
            Username = user.UserName,
            KnownAs = user.KnownAs,
            Token = tokenService.CreateToken(user),
            PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url,
            Gender = user.Gender
        };
    }

    private async Task<bool> UserExists(string username)
    {
        return await context.Users.AnyAsync(u => u.NormalizedUserName == username.ToUpper());
    }
}
