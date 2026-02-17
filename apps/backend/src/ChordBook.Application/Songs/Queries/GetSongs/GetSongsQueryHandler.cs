using ChordBook.Application.Common.Interfaces;
using ChordBook.Application.Songs.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChordBook.Application.Songs.Queries.GetSongs;

public class GetSongsQueryHandler
    : IRequestHandler<GetSongsQuery, IEnumerable<SongListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSongsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SongListItemDto>> Handle(
        GetSongsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Songs
            .Where(s => s.UserId == request.UserId)
            .OrderByDescending(s => s.UpdatedAt)
            .Select(s => new SongListItemDto(
                s.Id, s.Title, s.Artist, s.Key, s.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
}
