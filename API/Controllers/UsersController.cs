using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await userRepository.GetMembersAsync();

        return Ok(users);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUserById(string username)
    {
        var user = await userRepository.GetMemberAsync(username);

        if (user is null) return NotFound();

        return user;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(username == null) return BadRequest("no username found in token");

        var user = await userRepository.GetUserByUsernameAsync(username);

        if(user == null) return BadRequest("Could not find user");

        // We're updating the "user" content
        // By doing the "map" like this, AutoMapper map the content of "memberUpdateDto" inside "user"
        // This means it updates the "user" variable with the content of "memberUpdateDto"
        mapper.Map(memberUpdateDto, user);

        return await userRepository.SaveAllAsync() ? NoContent() : BadRequest("Failed to update the user");
    }
}
