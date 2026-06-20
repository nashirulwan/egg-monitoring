### Egg Monitoring

End-to-end IoT system for a poultry farm — ESP32 sensors stream temperature, humidity, and gas readings to a Next.js dashboard with remote actuator control (fan, lamp, conveyor) and an AI layer for freshness/anomaly prediction. IoT course project.

#### What's inside

- `web/` — Next.js dashboard + API (Prisma + SQLite), real-time charts and actuator control
- `firmware/` — ESP32 device firmware (PlatformIO) that reads the sensors
- `ml/` — AI prediction pipeline notebook (`egg_monitoring_ai_pipeline.ipynb`) + sample data
- `protocol-comparison/` — side study comparing MQTT vs HTTP for shipping sensor data from an ESP32
- `docs/` — design notes (AI prediction)

#### Stack

ESP32 · Next.js · Prisma / SQLite · Cloudflare Tunnel · Python (ML)

#### Notes

Built for an IoT course and self-hosted at `egg.nashiru.me` during the semester. The bundled `web/prisma/dev.db` holds real captured data (~4.3k sensor readings, 162 egg events), so the dashboard and notebook run out of the box.
