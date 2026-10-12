var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAngularLocal", policy =>
  {
    // Разрешаем конкретный origin Angular
    policy.WithOrigins("http://localhost:50000","http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod();
  });
});

// Добавляем контроллеры
builder.Services.AddControllers();

// Регистрируем InventoryService как синглтон (чтобы один экземпляр загружал JSON)
builder.Services.AddSingleton<IInventoryService, InventoryService>();

var app = builder.Build();

// Конвейер HTTP
if (app.Environment.IsDevelopment())
{
  app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseCors("AllowAngularLocal");
app.UseRouting();
app.MapControllers();

app.Run();
