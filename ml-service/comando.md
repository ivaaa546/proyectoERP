
# 1) Levantar microservicio ML con Docker
cd D:\Proyectos\saas\ml-service
docker build -t ml-service .
docker run --rm -p 8000:8000 --name ml-service ml-service
En otra terminal:

# 2) Levantar backend apuntando al ML service
cd D:\Proyectos\saas\backend
$env:ML_SERVICE_URL="http://localhost:8000"
npm run dev
Opcional verificación rápida:
Invoke-RestMethod http://localhost:8000/v1/health