$email = "taha.arslan@std.ankaramedipol.edu.tr"  # Burayı gerçek bir kullanıcı e-posta adresi ile değiştirin

$body = @{
    email = $email
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/create-admin" -Method POST -Body $body -ContentType "application/json"

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
