using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService<ImageUploadResult, DeletionResult> photoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await userRepository.GetMembersAsync();

        return Ok(users);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
        var user = await userRepository.GetMemberAsync(username);

        if (user is null) return NotFound();

        return user;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var user = await GetConnectedUser(userRepository);

        if (user == null) return BadRequest("Could not find user");

        // We're updating the "user" content
        // By doing the "map" like this, AutoMapper map the content of "memberUpdateDto" inside "user"
        // This means it updates the "user" variable with the content of "memberUpdateDto"
        mapper.Map(memberUpdateDto, user);

        return await userRepository.SaveAllAsync() ? NoContent() : BadRequest("Failed to update the user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
        var user = await GetConnectedUser(userRepository);

        if (user == null) return BadRequest("Can't update user");

        var result = await photoService.AddPhotoAsync(file);

        if (result.HasError()) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        user.Photos.Add(photo);

        return await userRepository.SaveAllAsync() ? CreatedAtAction(nameof(GetUser), new { username = user.UserName }, mapper.Map<PhotoDto>(photo)) : BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var user = await GetConnectedUser(userRepository);

        if (user == null) return BadRequest("Could not find user");

        var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

        if (photo == null) return BadRequest($"No photo found for the id {photoId}");
        if (photo.IsMain) return BadRequest($"Photo with id '{photoId}' is already the main photo");

        var currentMain = user.Photos.FirstOrDefault(p => p.IsMain);
        if (currentMain != null) currentMain.IsMain = false;
        photo.IsMain = true;

        return await userRepository.SaveAllAsync() ? NoContent() : BadRequest("A problem occure while setting the main photo");
    }

    private Task<AppUser?> GetConnectedUser(IUserRepository userRepository)
    {
        return userRepository.GetUserByUsernameAsync(User.GetUsername());
    }
}
