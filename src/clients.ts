import { createClient as createDnsClient } from "@lumeweb/kernel-dns-client";
import { createClient as createIpfsClient } from "@lumeweb/kernel-ipfs-client";
import { createClient as createSwarmClient } from "@lumeweb/kernel-swarm-client";
import { createClient as createPeerDiscoveryClient } from "@lumeweb/kernel-peer-discovery-client";
import { createClient as createNetworkRegistryClient } from "@lumeweb/kernel-network-registry-client";
import { createClient as createHandshakeClient } from "@lumeweb/kernel-handshake-client";
import { createClient as createEthClient } from "@lumeweb/kernel-eth-client";
import { createClient as createS5Client } from "@lumeweb/kernel-s5-client";

const dnsClient = createDnsClient();
const ipfsClient = createIpfsClient();
const swarmClient = createSwarmClient();
const peerDiscoveryClient = createPeerDiscoveryClient();
const networkRegistryClient = createNetworkRegistryClient();
const handshakeClient = createHandshakeClient();
const ethClient = createEthClient();
const s5Client = createS5Client();

export {
  dnsClient,
  ipfsClient,
  swarmClient,
  peerDiscoveryClient,
  networkRegistryClient,
  handshakeClient,
  ethClient,
  s5Client,
};
