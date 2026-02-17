using ChordBook.Application.Songs.DTOs;
using MediatR;
using System.Text.Json;

namespace ChordBook.Application.Songs.Commands.UpdateSong;

public record UpdateSongCommand(
    Guid Id,
    Guid UserId,
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature,
    JsonElement Content
) : IRequest<SongDto?>;
