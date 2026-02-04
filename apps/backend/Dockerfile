FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/ChordBook.Api/ChordBook.Api.csproj", "ChordBook.Api/"]
COPY ["src/ChordBook.Application/ChordBook.Application.csproj", "ChordBook.Application/"]
COPY ["src/ChordBook.Domain/ChordBook.Domain.csproj", "ChordBook.Domain/"]
COPY ["src/ChordBook.Infrastructure/ChordBook.Infrastructure.csproj", "ChordBook.Infrastructure/"]
RUN dotnet restore "ChordBook.Api/ChordBook.Api.csproj"
COPY src/ .
WORKDIR "/src/ChordBook.Api"
RUN dotnet build "ChordBook.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ChordBook.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ChordBook.Api.dll"]
