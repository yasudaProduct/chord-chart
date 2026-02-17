using ChordBook.Application.Songs.DTOs;
using MediatR;

namespace ChordBook.Application.Songs.Commands.CreateSong;

public record CreateSongCommand(
    Guid UserId,
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature
) : IRequest<SongDto>;
