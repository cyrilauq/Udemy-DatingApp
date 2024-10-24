using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController(DataContext context) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<AppUser>> Register([FromBody] string username, [FromBody] string password) 
    {
        /// the "using" will release the current instance of the HMACSHA512 we're creating
        /// This means that the instance will be disposed when we'vefinished using it
        /// We can omits the "using" and let the garbage collector do it but we have no control of it and so we don't know when the disposing will be done
        /// The usage of "using" is a better solution
        using var hmac = new HMACSHA512();

        var user = new AppUser() 
        {
            UserName = username,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
            PasswordSalt = hmac.Key
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }
}
