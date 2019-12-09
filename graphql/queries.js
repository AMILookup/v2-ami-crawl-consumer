/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAmi = `query GetAmi($id: ID!) {
  getAmi(id: $id) {
    id
    name
    description
    virtualizationtype
    hypervisor
    imageowneralias
    enasupport
    sriovnetsupport
    imageid
    state
    blockdevicemappings
    architecture
    imagelocation
    rootdevicetype
    ownerid
    roodevicename
    creationdate
    public
    imagetype
    crawledtime
  }
}
`;
export const listAmis = `query ListAmis($filter: ModelamiFilterInput, $limit: Int, $nextToken: String) {
  listAmis(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      description
      virtualizationtype
      hypervisor
      imageowneralias
      enasupport
      sriovnetsupport
      imageid
      state
      blockdevicemappings
      architecture
      imagelocation
      rootdevicetype
      ownerid
      roodevicename
      creationdate
      public
      imagetype
      crawledtime
    }
    nextToken
  }
}
`;
