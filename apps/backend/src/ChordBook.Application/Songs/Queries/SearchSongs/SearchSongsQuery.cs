using ChordBook.Application.Songs.DTOs;
using MediatR;

namespace ChordBook.Application.Songs.Queries.SearchSongs;

public record SearchSongsQuery(string? Query) : IRequest<IEnumerable<SongListItemDto>>;
