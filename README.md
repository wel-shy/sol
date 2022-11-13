# Sol

Update smart light colours based on the suns position in the sky. I.e. Orange for golden hours
white for mid day, and blue for blue hours.

## Supported Gateways

- IKEA Trådfri

## Setup

1. Copy `.env.example`, the hub code is printed on the underside of the IKEA Trådfri Gateway.
2. Run `npm install && npx tsc`

## Run

```bash
node ./build/index.js <LIGHT_NAME> <dry-run>
```