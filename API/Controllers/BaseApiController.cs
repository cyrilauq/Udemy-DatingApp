using API.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ServiceFilter(typeof(LogUserAcivity))]
[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
}
