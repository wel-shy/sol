import {
  DiscoveredGateway,
  discoverGateway,
  TradfriClient,
} from "node-tradfri-client";

export const getGateway = async (): Promise<DiscoveredGateway | null> => {
  const gateway = await discoverGateway();
  return gateway;
};

export const createClient = async (
  gateway: DiscoveredGateway
): Promise<TradfriClient> => {
  const client = new TradfriClient(gateway.addresses[0]);
  return client;
};

export const authenticateToGateway = async (
  client: TradfriClient,
  securityCode: string
) => {
  const { identity, psk } = await client.authenticate(securityCode);
  client.connect(identity, psk);
};
