using MediatR;

namespace ChordBook.Application.Songs.Commands.DeleteSong;

public record DeleteSongCommand(Guid Id, Guid UserId) : IRequest<bool>;
