using ChordBook.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChordBook.Application.Songs.Commands.DeleteSong;

public class DeleteSongCommandHandler
    : IRequestHandler<DeleteSongCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteSongCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        DeleteSongCommand request, CancellationToken cancellationToken)
    {
        var song = await _context.Songs
            .FirstOrDefaultAsync(
                s => s.Id == request.Id && s.UserId == request.UserId,
                cancellationToken);

        if (song is null) return false;

        _context.Songs.Remove(song);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
