using Acme.Product.Sockets.Hubs;
using Acme.Product.Sockets.Services;
using Acme.Product.Sockets.Services.Interfaces;

const string MyCorsPolicy = "CorsPolicy";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddSingleton<ILockService, LockService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(MyCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(MyCorsPolicy);
app.MapControllers();

app.MapHub<RealTimeHub>("/realtimehub");

app.Run();