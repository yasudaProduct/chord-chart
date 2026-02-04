using ChordBook.Domain.Enums;

namespace ChordBook.Application.Songs.DTOs;

public record SongDto(
    Guid Id,
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature,
    string Content,
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
    string TimeSignature
);

public record UpdateSongDto(
    string Title,
    string? Artist,
    string? Key,
    int? Bpm,
    string TimeSignature,
    string Content
);
