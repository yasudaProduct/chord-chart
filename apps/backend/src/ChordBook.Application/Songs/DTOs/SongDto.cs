using ChordBook.Domain.Enums;
using System.Text.Json;

namespace ChordBook.Application.Songs.DTOs;

public record SongDto(
    Guid Id,
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature,
    JsonElement Content,
    Visibility Visibility,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record SongListItemDto(
    Guid Id,
    string Title,
    string? Artist,
    string? Key,
    DateTime UpdatedAt
);

public record CreateSongDto(
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature = "4/4"
);

public record UpdateSongDto(
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature,
    JsonElement Content
);
