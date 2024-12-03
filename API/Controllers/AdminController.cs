using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AdminController : BaseApiController
{
    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users")]
    public ActionResult GetUsersWithRoles()
    {
        return Ok("Only admins can see this");
    }
    
    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("moderate")]
    public ActionResult GetGetPhotosForModeration()
    {
        return Ok("Only admins can see this");
    }
}
