using Microsoft.AspNetCore.Mvc;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok("Auth Service Running");
    }
}