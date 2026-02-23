using ChordBook.Application.Common.Interfaces;
using ChordBook.Application.Songs.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChordBook.Application.Songs.Commands.UpdateSong;

public class UpdateSongCommandHandler
    : IRequestHandler<UpdateSongCommand, SongDto?>
{
    private readonly IApplicationDbContext _context;

    public UpdateSongCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SongDto?> Handle(
        UpdateSongCommand request, CancellationToken cancellationToken)
    {
        var song = await _context.Songs
            .FirstOrDefaultAsync(
                s => s.Id == request.Id && s.UserId == request.UserId,
                cancellationToken);

        if (song is null) return null;

        song.UpdateMeta(
            request.Title, request.Artist, request.Key,
            request.Bpm, request.TimeSignature);
        song.UpdateContent(request.Content.GetRawText());

        await _context.SaveChangesAsync(cancellationToken);

        var content = JsonSerializer.Deserialize<JsonElement>(song.Content);
        return new SongDto(
            song.Id, song.Title, song.Artist, song.Key, song.Bpm,
            song.TimeSignature, content, song.Visibility,
            song.CreatedAt, song.UpdatedAt);
    }
}
