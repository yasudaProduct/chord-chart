using ChordBook.Application.Common.Interfaces;
using ChordBook.Application.Songs.DTOs;
using ChordBook.Domain.Entities;
using MediatR;
using System.Text.Json;

namespace ChordBook.Application.Songs.Commands.CreateSong;

public class CreateSongCommandHandler
    : IRequestHandler<CreateSongCommand, SongDto>
{
    private readonly IApplicationDbContext _context;

    public CreateSongCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SongDto> Handle(
        CreateSongCommand request, CancellationToken cancellationToken)
    {
        var song = Song.Create(
            request.UserId, request.Title, request.Artist,
            request.Key, request.Bpm, request.TimeSignature);

        _context.Songs.Add(song);
        await _context.SaveChangesAsync(cancellationToken);

        var content = JsonSerializer.Deserialize<JsonElement>(song.Content);
        return new SongDto(
            song.Id, song.Title, song.Artist, song.Key, song.Bpm,
            song.TimeSignature, content, song.Visibility,
            song.CreatedAt, song.UpdatedAt);
    }
}
