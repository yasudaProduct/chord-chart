using ChordBook.Application.Common.Interfaces;
using ChordBook.Application.Songs.DTOs;
using ChordBook.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChordBook.Application.Songs.Queries.SearchSongs;

public class SearchSongsQueryHandler
    : IRequestHandler<SearchSongsQuery, IEnumerable<SongListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchSongsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SongListItemDto>> Handle(
        SearchSongsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Songs
            .Where(s => s.Visibility == Visibility.Public);

        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(s =>
                s.Title.ToLower().Contains(searchTerm) ||
                (s.Artist ?? "").ToLower().Contains(searchTerm) ||
                (s.Key ?? "").ToLower().Contains(searchTerm));
        }

        return await query
            .OrderByDescending(s => s.UpdatedAt)
            .Select(s => new SongListItemDto(
                s.Id, s.Title, s.Artist, s.Key, s.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
}
