#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["SU_COIN_BACK_END.csproj", "."]
RUN dotnet restore "./SU_COIN_BACK_END.csproj"
COPY ./ ./
WORKDIR "/src/."
RUN dotnet build "SU_COIN_BACK_END.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SU_COIN_BACK_END.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SU_COIN_BACK_END.dll"]