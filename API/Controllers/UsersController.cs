using System.Collections.Generic;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(DataContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers() 
    {
        var users = await context.Users.ToListAsync();

        return Ok(users);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppUser>> GetUserById(int id) 
    {
        var user = await context.Users.FindAsync(id);

        if(user is null) return NotFound();

        return user;
    }
}
