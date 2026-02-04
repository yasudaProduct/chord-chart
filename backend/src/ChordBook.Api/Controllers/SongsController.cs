using ChordBook.Application.Songs.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChordBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SongListItemDto>>> GetSongs()
    {
        // TODO: Implement with MediatR
        return Ok(Array.Empty<SongListItemDto>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SongDto>> GetSong(Guid id)
    {
        // TODO: Implement with MediatR
        return NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<SongDto>> CreateSong([FromBody] CreateSongDto dto)
    {
        // TODO: Implement with MediatR
        return CreatedAtAction(nameof(GetSong), new { id = Guid.NewGuid() }, null);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateSong(Guid id, [FromBody] UpdateSongDto dto)
    {
        // TODO: Implement with MediatR
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteSong(Guid id)
    {
        // TODO: Implement with MediatR
        return NoContent();
    }
}
