using System.Net;
using System.Net.Mail;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

LoadDotEnv();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Configuration.AddEnvironmentVariables();

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/email/booking-confirmation", async (
    AppointmentNotificationRequest request,
    IConfiguration configuration,
    ILogger<Program> logger) =>
{
    if (string.IsNullOrWhiteSpace(request.Nombre) ||
        string.IsNullOrWhiteSpace(request.Correo) ||
        string.IsNullOrWhiteSpace(request.Fecha) ||
        string.IsNullOrWhiteSpace(request.HoraInicio) ||
        string.IsNullOrWhiteSpace(request.HoraFin) ||
        request.ServiciosSeleccionados is null ||
        request.ServiciosSeleccionados.Count == 0 ||
        request.DuracionMinutos <= 0)
    {
        logger.LogWarning("Solicitud de correo invalida para {Correo}", request.Correo);
        return Results.BadRequest(new { message = "Datos incompletos para enviar el correo." });
    }

    var smtpEmail = configuration["SMTP_EMAIL"];
    var smtpPassword = configuration["SMTP_APP_PASSWORD"];

    if (string.IsNullOrWhiteSpace(smtpEmail) || string.IsNullOrWhiteSpace(smtpPassword))
    {
        logger.LogError("Faltan SMTP_EMAIL o SMTP_APP_PASSWORD.");
        return Results.Problem("La configuracion SMTP no esta completa.", statusCode: 500);
    }

    var eventType = string.IsNullOrWhiteSpace(request.Event)
        ? "CREATED"
        : request.Event.Trim().ToUpperInvariant();
    var servicesText = string.Join(", ", request.ServiciosSeleccionados);
    var content = BuildEmailContent(eventType, request, servicesText);

    try
    {
        using var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(smtpEmail, smtpPassword)
        };

        using var mail = new MailMessage
        {
            From = new MailAddress(smtpEmail, "Valhalla Lounge Barber"),
            Subject = content.Subject,
            Body = content.PlainTextBody,
            IsBodyHtml = false
        };

        mail.To.Add(request.Correo);
        mail.AlternateViews.Add(
            AlternateView.CreateAlternateViewFromString(content.HtmlBody, Encoding.UTF8, "text/html")
        );

        await client.SendMailAsync(mail);
        logger.LogInformation("Correo de {EventType} enviado a {Correo}", eventType, request.Correo);

        return Results.Ok(new { message = "Correo enviado correctamente." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error enviando correo a {Correo}", request.Correo);
        return Results.Problem("No se pudo enviar el correo.", statusCode: 500);
    }
});

app.Run();

static EmailContent BuildEmailContent(
    string eventType,
    AppointmentNotificationRequest request,
    string servicesText)
{
    var previousBlockHtml = string.Empty;
    var previousBlockText = string.Empty;

    if (request.PreviousSchedule is not null)
    {
        previousBlockHtml = $"""
            <li><strong>Fecha anterior:</strong> {WebUtility.HtmlEncode(request.PreviousSchedule.Fecha)}</li>
            <li><strong>Hora anterior:</strong> {WebUtility.HtmlEncode(request.PreviousSchedule.HoraInicio)} - {WebUtility.HtmlEncode(request.PreviousSchedule.HoraFin)}</li>
            """;

        previousBlockText = $"""
            Fecha anterior: {request.PreviousSchedule.Fecha}
            Hora anterior: {request.PreviousSchedule.HoraInicio} - {request.PreviousSchedule.HoraFin}
            """;
    }

    return eventType switch
    {
        "CANCELLED" => new EmailContent(
            "Cancelacion de reserva - Valhalla Lounge Barber",
            $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#1f1f1f;line-height:1.6">
              <h2 style="color:#9f6a2a">Reserva cancelada - Valhalla Lounge Barber</h2>
              <p>Hola <strong>{WebUtility.HtmlEncode(request.Nombre)}</strong>, tu cita ha sido cancelada.</p>
              <ul>
                <li><strong>Fecha:</strong> {WebUtility.HtmlEncode(request.Fecha)}</li>
                <li><strong>Hora:</strong> {WebUtility.HtmlEncode(request.HoraInicio)} - {WebUtility.HtmlEncode(request.HoraFin)}</li>
                <li><strong>Servicios:</strong> {WebUtility.HtmlEncode(servicesText)}</li>
              </ul>
              <p>Si deseas agendar una nueva visita, estaremos encantados de atenderte.</p>
            </div>
            """,
            new StringBuilder()
                .AppendLine("Reserva cancelada - Valhalla Lounge Barber")
                .AppendLine()
                .AppendLine($"Cliente: {request.Nombre}")
                .AppendLine($"Fecha: {request.Fecha}")
                .AppendLine($"Hora: {request.HoraInicio} - {request.HoraFin}")
                .AppendLine($"Servicios: {servicesText}")
                .AppendLine()
                .AppendLine("Tu cita ha sido cancelada.")
                .ToString()
        ),
        "RESCHEDULED" => new EmailContent(
            "Reagendamiento de reserva - Valhalla Lounge Barber",
            $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#1f1f1f;line-height:1.6">
              <h2 style="color:#9f6a2a">Reserva reagendada - Valhalla Lounge Barber</h2>
              <p>Hola <strong>{WebUtility.HtmlEncode(request.Nombre)}</strong>, tu cita fue reagendada.</p>
              <ul>
                {previousBlockHtml}
                <li><strong>Nueva fecha:</strong> {WebUtility.HtmlEncode(request.Fecha)}</li>
                <li><strong>Nueva hora:</strong> {WebUtility.HtmlEncode(request.HoraInicio)} - {WebUtility.HtmlEncode(request.HoraFin)}</li>
                <li><strong>Servicios:</strong> {WebUtility.HtmlEncode(servicesText)}</li>
                <li><strong>Duracion total:</strong> {request.DuracionMinutos} minutos</li>
              </ul>
              <p>Te esperamos en tu nuevo horario.</p>
            </div>
            """,
            new StringBuilder()
                .AppendLine("Reserva reagendada - Valhalla Lounge Barber")
                .AppendLine()
                .AppendLine($"Cliente: {request.Nombre}")
                .AppendLine(previousBlockText)
                .AppendLine($"Nueva fecha: {request.Fecha}")
                .AppendLine($"Nueva hora: {request.HoraInicio} - {request.HoraFin}")
                .AppendLine($"Servicios: {servicesText}")
                .AppendLine($"Duracion total: {request.DuracionMinutos} minutos")
                .AppendLine()
                .AppendLine("Tu cita fue reagendada.")
                .ToString()
        ),
        _ => new EmailContent(
            "Confirmacion de reserva - Valhalla Lounge Barber",
            $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#1f1f1f;line-height:1.6">
              <h2 style="color:#9f6a2a">Reserva confirmada - Valhalla Lounge Barber</h2>
              <p>Hola <strong>{WebUtility.HtmlEncode(request.Nombre)}</strong>, tu cita ha sido confirmada.</p>
              <ul>
                <li><strong>Fecha:</strong> {WebUtility.HtmlEncode(request.Fecha)}</li>
                <li><strong>Hora de inicio:</strong> {WebUtility.HtmlEncode(request.HoraInicio)}</li>
                <li><strong>Hora de fin:</strong> {WebUtility.HtmlEncode(request.HoraFin)}</li>
                <li><strong>Servicios:</strong> {WebUtility.HtmlEncode(servicesText)}</li>
                <li><strong>Duracion total:</strong> {request.DuracionMinutos} minutos</li>
              </ul>
              <p>Te esperamos en Valhalla Lounge Barber. Gracias por agendar con nosotros.</p>
            </div>
            """,
            new StringBuilder()
                .AppendLine("Reserva confirmada - Valhalla Lounge Barber")
                .AppendLine()
                .AppendLine($"Cliente: {request.Nombre}")
                .AppendLine($"Fecha: {request.Fecha}")
                .AppendLine($"Hora de inicio: {request.HoraInicio}")
                .AppendLine($"Hora de fin: {request.HoraFin}")
                .AppendLine($"Servicios: {servicesText}")
                .AppendLine($"Duracion total: {request.DuracionMinutos} minutos")
                .AppendLine()
                .AppendLine("Tu cita ha sido confirmada. Gracias por agendar con nosotros.")
                .ToString()
        )
    };
}

static void LoadDotEnv()
{
    var currentDirectory = Directory.GetCurrentDirectory();
    var candidatePaths = new[]
    {
        Path.Combine(currentDirectory, ".env"),
        Path.Combine(Directory.GetParent(currentDirectory)?.FullName ?? currentDirectory, ".env"),
        Path.Combine(Directory.GetParent(currentDirectory)?.Parent?.FullName ?? currentDirectory, ".env")
    };

    var envPath = candidatePaths.FirstOrDefault(File.Exists);
    if (envPath is null)
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(envPath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#") || !line.Contains('='))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (!string.IsNullOrWhiteSpace(key) && string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

internal sealed record EmailContent(string Subject, string HtmlBody, string PlainTextBody);

internal sealed class AppointmentNotificationRequest
{
    public string Event { get; init; } = "CREATED";
    public string AppointmentId { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string Correo { get; init; } = string.Empty;
    public string Telefono { get; init; } = string.Empty;
    public string Fecha { get; init; } = string.Empty;
    public string HoraInicio { get; init; } = string.Empty;
    public string HoraFin { get; init; } = string.Empty;
    public List<string> ServiciosSeleccionados { get; init; } = [];
    public int DuracionMinutos { get; init; }
    public PreviousScheduleSnapshot? PreviousSchedule { get; init; }
}

internal sealed class PreviousScheduleSnapshot
{
    public string Fecha { get; init; } = string.Empty;
    public string HoraInicio { get; init; } = string.Empty;
    public string HoraFin { get; init; } = string.Empty;
}
