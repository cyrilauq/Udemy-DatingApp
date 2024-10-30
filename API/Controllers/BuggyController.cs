using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BuggyController(DataContext context) : ControllerBase
{
    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetAuth() 
    {
        return "secret text";
    }
    
    [HttpGet("not-found")]
    public ActionResult<AppUser> GetNotFound() 
    {
        var thing = context.Users.Find(-1);

        if(thing == null) return NotFound();

        return thing;
    }
    
    [HttpGet("server-error")]
    public ActionResult<AppUser> GetServerError() 
    {
        var thing = context.Users.Find(-1) ?? throw new Exception("A bad thing has happened");
        return thing;
    }
    
    [HttpGet("bad-request")]
    public ActionResult<AppUser> GetBadRequest() 
    {
        var thing = context.Users.Find(-1);

        if(thing == null) return BadRequest("This was not a good request");

        return thing;
    }
}
