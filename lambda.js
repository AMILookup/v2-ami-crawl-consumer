const fetch = require("node-fetch");
var queue_url = "https://sqs.us-east-1.amazonaws.com/124775650587/crawled_amis"
var region = "us-east-1"
var api_url = "https://3pqjpmfparbebcc3zb4quz2zhm.appsync-api.us-east-1.amazonaws.com/graphql"

var AWS = require("aws-sdk");

AWS.config.update({region:region});
AWS.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
        console.log("Credentials Found");
        // console.log("Access key:", AWS.config.credentials.accessKeyId);
        // console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
    }
  });

function generate_uuid(){
    const uuidv4 = require('uuid/v4');
    return uuidv4();
}

async function fetchOptions(url, options) {
    
    // let response = await fetch(url, options); // resolves with response headers
    // let result = await response.json(); // read body as json

    data = fetch(url, options)
    .then(res => res.json());

    return data

}

async function graphql_create(api_url, ami, uuid) {

    id = uuid
    name = ami.Name
    description = ami.Description
    imageid = ami.ImageId
    virtualizationtype = ami.VirtualizationType
    hypervisor = ami.Hypervisor
    imageowneralias = ami.ImageOwnerAlias
    enasupport = ami.EnaSupport
    sriovnetsupport = ami.SriovNetSupport
    state = ami.State
    blockdevicemappings = ami.BlockDeviceMappings
    architecture = ami.Architecture
    imagelocation = ami.ImageLocation
    rootdevicetype = ami.RootDeviceType
    ownerid = ami.OwnerId
    roodevicename = ami.RootDeviceName
    creationdate = ami.CreationDate
    public = ami.Public
    imagetype = ami.ImageType
    crawledtime = ami.CrawledTime

    const query = `mutation CreateAmi($input: CreateAmiInput!) {
        createAmi(input: $input) {
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
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': 'da2-uf5dv3btxrasjhrcaavhnqsx64',
        },
        body: JSON.stringify({
            query,
            variables: {
                input: {
                    id,
                    name,
                    description,
                    virtualizationtype,
                    hypervisor,
                    imageowneralias,
                    enasupport,
                    sriovnetsupport,
                    imageid,
                    state,
                    blockdevicemappings,
                    architecture,
                    imagelocation,
                    rootdevicetype,
                    ownerid,
                    roodevicename,
                    creationdate,
                    public,
                    imagetype,
                    crawledtime,
                }
            },
        })
    }


    // console.log("Create Options: ", options);
    // fetchOption = fetchOptions(api_url, options)
    // fetchOption = fetchOption.then(function(results){
    //     // console.log("fetch options:", results);
    // })

    fetchOption = await fetchOptions(api_url, options)

    return fetchOption

    // console.log("Create Options: ", options);
    // return new Promise(function (resolve, reject) {
    //     fetchOptions(api_url, options)
    // })
}

async function graphql_read(api_url, uuid){
    id = uuid

    const query = `query GetAmi($id: ID!) {
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

    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': 'da2-uf5dv3btxrasjhrcaavhnqsx64',
        },
        body: JSON.stringify({
            query,
            variables: {
                id
            },
        })
    }

    // console.log("Read Options: ", options);
    // fetchOption = fetchOptions(api_url, options)
    // fetchOption = fetchOption.then(function(results){
    //     // console.log("fetch options:", results);
    //     if ( results.data.getAmi == null ) {
    //         return null
    //     }
    //     else if ( results.data.getAmi != null ) {
    //         return results
    //     }
    // })

    fetchOption = await fetchOptions(api_url, options)
    if ( fetchOption.data.getAmi == null ) {
        return null
    }
    else if ( fetchOption.data.getAmi != null ) {
        return fetchOption
    }

    return fetchOption

}

exports.handler = async function (event, context) {
    console.log("Got Event:" + JSON.stringify(event));

    for (let i of event.Records) {
        i = JSON.parse(i.body)

        uuid = generate_uuid();
        console.log(uuid);

        // Fix AMI Blank Strings
        for (item in i) {
            if ( i[item] === "" ) {
                i[item] = null
            }
        };

        async function runner(api_url, i, uuid) {

            read = await graphql_read(api_url, uuid)
            console.log("Read Results:", read);

            if ( read != null ) {
                console.error("This Failed, because:", read.errors)
                process.exit(1);
            }

            if ( read == null ) {
                create = await graphql_create(api_url, i, uuid)
                console.log("Create Results:", create);

                if ( create.errors ) {
                    console.error("This Failed, because:", create.errors)
                    process.exit(1);
                }
            }

        }
        
        runner = await runner(api_url, i, uuid)

    };



}

var event = {
    "Records": [
        {
            "messageId": "2c45338e-9b3d-41f3-a52e-c17137fcb649",
            "receiptHandle": "AQEBwF7W/zVwCni+0QUZKrgmLRRbBwoynYDnlN28hT5n8NSRp9lf526LcszoVHgT07d+r1vRmvUyc6x0qmUrXf7VPmCWBoq7mwWHo/JLTrdi4miON9IqIQKMXEzPpUX9q2MR9xikAOkA7NV7n2RFBbsolw0TcKUNpwQNy+1tjyKHZuwN4L09auzxIiPfUH+2vPRSm5UtxmORm9levJ0JwvUpmAV2+XEkd2gOm8R7MQo+/SsaPA6vvK2Vi27w5fs/t1CZ4Ov4U1VZTWqQ/eYCEski6lqUeh63QuxV1s4Daali9wUkgl5afO2FMJvG7e/fCgZgyOPYIg2ep8Y9Jg9MOfe4dpyCKnZShs/1J8PCxKzIeV71ral/9KnVss92+4E6IKoiXqdV+MSoxxjING7hrZ5FEw==",
            "body": "{\"Architecture\":\"x86_64\",\"CreationDate\":\"2018-01-04T20:03:55.000Z\",\"ImageId\":\"ami-fa411080\",\"ImageLocation\":\"401256526376/CRICKET_NV2\",\"ImageType\":\"machine\",\"Public\":true,\"OwnerId\":\"401256526376\",\"Platform\":\"windows\",\"ProductCodes\":[],\"State\":\"available\",\"BlockDeviceMappings\":[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"DeleteOnTermination\":false,\"SnapshotId\":\"snap-0d5ebc3a4f579e955\",\"VolumeSize\":30,\"VolumeType\":\"gp2\",\"Encrypted\":false}}],\"Description\":\"[Copied ami-b9efc4dc from us-east-2] CRICKET_NV2\",\"EnaSupport\":false,\"Hypervisor\":\"xen\",\"Name\":\"CRICKET_NV2\",\"RootDeviceName\":\"/dev/sda1\",\"RootDeviceType\":\"ebs\",\"Tags\":[],\"VirtualizationType\":\"hvm\",\"CrawledTime\":1575728719038,\"Region\":\"us-east-1\"}",
            "attributes": {
                "ApproximateReceiveCount": "2",
                "SentTimestamp": "1575728976759",
                "SenderId": "AROAR2DJVKUN62A43DPIT:d43cd21e7b924d8c9dc05b122a582d94",
                "ApproximateFirstReceiveTimestamp": "1575755245379"
            },
            "messageAttributes": {},
            "md5OfBody": "ea73c903c9f66ed25439dac74a3cb1cc",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:124775650587:crawled_amis",
            "awsRegion": "us-east-1"
        },
        {
            "messageId": "2c45338e-9b3d-41f3-a52e-c17137fcb649",
            "receiptHandle": "AQEBwF7W/zVwCni+0QUZKrgmLRRbBwoynYDnlN28hT5n8NSRp9lf526LcszoVHgT07d+r1vRmvUyc6x0qmUrXf7VPmCWBoq7mwWHo/JLTrdi4miON9IqIQKMXEzPpUX9q2MR9xikAOkA7NV7n2RFBbsolw0TcKUNpwQNy+1tjyKHZuwN4L09auzxIiPfUH+2vPRSm5UtxmORm9levJ0JwvUpmAV2+XEkd2gOm8R7MQo+/SsaPA6vvK2Vi27w5fs/t1CZ4Ov4U1VZTWqQ/eYCEski6lqUeh63QuxV1s4Daali9wUkgl5afO2FMJvG7e/fCgZgyOPYIg2ep8Y9Jg9MOfe4dpyCKnZShs/1J8PCxKzIeV71ral/9KnVss92+4E6IKoiXqdV+MSoxxjING7hrZ5FEw==",
            "body": "{\"Architecture\":\"x86_64\",\"CreationDate\":\"2018-01-04T20:03:55.000Z\",\"ImageId\":\"ami-fa411080\",\"ImageLocation\":\"401256526376/CRICKET_NV2\",\"ImageType\":\"machine\",\"Public\":true,\"OwnerId\":\"401256526376\",\"Platform\":\"windows\",\"ProductCodes\":[],\"State\":\"available\",\"BlockDeviceMappings\":[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"DeleteOnTermination\":false,\"SnapshotId\":\"snap-0d5ebc3a4f579e955\",\"VolumeSize\":30,\"VolumeType\":\"gp2\",\"Encrypted\":false}}],\"Description\":\"[Copied ami-b9efc4dc from us-east-2] CRICKET_NV2\",\"EnaSupport\":false,\"Hypervisor\":\"xen\",\"Name\":\"CRICKET_NV2\",\"RootDeviceName\":\"/dev/sda1\",\"RootDeviceType\":\"ebs\",\"Tags\":[],\"VirtualizationType\":\"hvm\",\"CrawledTime\":1575728719038,\"Region\":\"us-east-1\"}",
            "attributes": {
                "ApproximateReceiveCount": "2",
                "SentTimestamp": "1575728976759",
                "SenderId": "AROAR2DJVKUN62A43DPIT:d43cd21e7b924d8c9dc05b122a582d94",
                "ApproximateFirstReceiveTimestamp": "1575755245379"
            },
            "messageAttributes": {},
            "md5OfBody": "ea73c903c9f66ed25439dac74a3cb1cc",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:124775650587:crawled_amis",
            "awsRegion": "us-east-1"
        },
        {
            "messageId": "2c45338e-9b3d-41f3-a52e-c17137fcb649",
            "receiptHandle": "AQEBwF7W/zVwCni+0QUZKrgmLRRbBwoynYDnlN28hT5n8NSRp9lf526LcszoVHgT07d+r1vRmvUyc6x0qmUrXf7VPmCWBoq7mwWHo/JLTrdi4miON9IqIQKMXEzPpUX9q2MR9xikAOkA7NV7n2RFBbsolw0TcKUNpwQNy+1tjyKHZuwN4L09auzxIiPfUH+2vPRSm5UtxmORm9levJ0JwvUpmAV2+XEkd2gOm8R7MQo+/SsaPA6vvK2Vi27w5fs/t1CZ4Ov4U1VZTWqQ/eYCEski6lqUeh63QuxV1s4Daali9wUkgl5afO2FMJvG7e/fCgZgyOPYIg2ep8Y9Jg9MOfe4dpyCKnZShs/1J8PCxKzIeV71ral/9KnVss92+4E6IKoiXqdV+MSoxxjING7hrZ5FEw==",
            "body": "{\"Architecture\":\"x86_64\",\"CreationDate\":\"2018-01-04T20:03:55.000Z\",\"ImageId\":\"ami-fa411080\",\"ImageLocation\":\"401256526376/CRICKET_NV2\",\"ImageType\":\"machine\",\"Public\":true,\"OwnerId\":\"401256526376\",\"Platform\":\"windows\",\"ProductCodes\":[],\"State\":\"available\",\"BlockDeviceMappings\":[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"DeleteOnTermination\":false,\"SnapshotId\":\"snap-0d5ebc3a4f579e955\",\"VolumeSize\":30,\"VolumeType\":\"gp2\",\"Encrypted\":false}}],\"Description\":\"[Copied ami-b9efc4dc from us-east-2] CRICKET_NV2\",\"EnaSupport\":false,\"Hypervisor\":\"xen\",\"Name\":\"CRICKET_NV2\",\"RootDeviceName\":\"/dev/sda1\",\"RootDeviceType\":\"ebs\",\"Tags\":[],\"VirtualizationType\":\"hvm\",\"CrawledTime\":1575728719038,\"Region\":\"us-east-1\"}",
            "attributes": {
                "ApproximateReceiveCount": "2",
                "SentTimestamp": "1575728976759",
                "SenderId": "AROAR2DJVKUN62A43DPIT:d43cd21e7b924d8c9dc05b122a582d94",
                "ApproximateFirstReceiveTimestamp": "1575755245379"
            },
            "messageAttributes": {},
            "md5OfBody": "ea73c903c9f66ed25439dac74a3cb1cc",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:124775650587:crawled_amis",
            "awsRegion": "us-east-1"
        },
        {
            "messageId": "2c45338e-9b3d-41f3-a52e-c17137fcb649",
            "receiptHandle": "AQEBwF7W/zVwCni+0QUZKrgmLRRbBwoynYDnlN28hT5n8NSRp9lf526LcszoVHgT07d+r1vRmvUyc6x0qmUrXf7VPmCWBoq7mwWHo/JLTrdi4miON9IqIQKMXEzPpUX9q2MR9xikAOkA7NV7n2RFBbsolw0TcKUNpwQNy+1tjyKHZuwN4L09auzxIiPfUH+2vPRSm5UtxmORm9levJ0JwvUpmAV2+XEkd2gOm8R7MQo+/SsaPA6vvK2Vi27w5fs/t1CZ4Ov4U1VZTWqQ/eYCEski6lqUeh63QuxV1s4Daali9wUkgl5afO2FMJvG7e/fCgZgyOPYIg2ep8Y9Jg9MOfe4dpyCKnZShs/1J8PCxKzIeV71ral/9KnVss92+4E6IKoiXqdV+MSoxxjING7hrZ5FEw==",
            "body": "{\"Architecture\":\"x86_64\",\"CreationDate\":\"2018-01-04T20:03:55.000Z\",\"ImageId\":\"ami-fa411080\",\"ImageLocation\":\"401256526376/CRICKET_NV2\",\"ImageType\":\"machine\",\"Public\":true,\"OwnerId\":\"401256526376\",\"Platform\":\"windows\",\"ProductCodes\":[],\"State\":\"available\",\"BlockDeviceMappings\":[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"DeleteOnTermination\":false,\"SnapshotId\":\"snap-0d5ebc3a4f579e955\",\"VolumeSize\":30,\"VolumeType\":\"gp2\",\"Encrypted\":false}}],\"Description\":\"[Copied ami-b9efc4dc from us-east-2] CRICKET_NV2\",\"EnaSupport\":false,\"Hypervisor\":\"xen\",\"Name\":\"CRICKET_NV2\",\"RootDeviceName\":\"/dev/sda1\",\"RootDeviceType\":\"ebs\",\"Tags\":[],\"VirtualizationType\":\"hvm\",\"CrawledTime\":1575728719038,\"Region\":\"us-east-1\"}",
            "attributes": {
                "ApproximateReceiveCount": "2",
                "SentTimestamp": "1575728976759",
                "SenderId": "AROAR2DJVKUN62A43DPIT:d43cd21e7b924d8c9dc05b122a582d94",
                "ApproximateFirstReceiveTimestamp": "1575755245379"
            },
            "messageAttributes": {},
            "md5OfBody": "ea73c903c9f66ed25439dac74a3cb1cc",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:124775650587:crawled_amis",
            "awsRegion": "us-east-1"
        },
        {
            "messageId": "2c45338e-9b3d-41f3-a52e-c17137fcb649",
            "receiptHandle": "AQEBwF7W/zVwCni+0QUZKrgmLRRbBwoynYDnlN28hT5n8NSRp9lf526LcszoVHgT07d+r1vRmvUyc6x0qmUrXf7VPmCWBoq7mwWHo/JLTrdi4miON9IqIQKMXEzPpUX9q2MR9xikAOkA7NV7n2RFBbsolw0TcKUNpwQNy+1tjyKHZuwN4L09auzxIiPfUH+2vPRSm5UtxmORm9levJ0JwvUpmAV2+XEkd2gOm8R7MQo+/SsaPA6vvK2Vi27w5fs/t1CZ4Ov4U1VZTWqQ/eYCEski6lqUeh63QuxV1s4Daali9wUkgl5afO2FMJvG7e/fCgZgyOPYIg2ep8Y9Jg9MOfe4dpyCKnZShs/1J8PCxKzIeV71ral/9KnVss92+4E6IKoiXqdV+MSoxxjING7hrZ5FEw==",
            "body": "{\"Architecture\":\"x86_64\",\"CreationDate\":\"2018-01-04T20:03:55.000Z\",\"ImageId\":\"ami-fa411080\",\"ImageLocation\":\"401256526376/CRICKET_NV2\",\"ImageType\":\"machine\",\"Public\":true,\"OwnerId\":\"401256526376\",\"Platform\":\"windows\",\"ProductCodes\":[],\"State\":\"available\",\"BlockDeviceMappings\":[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"DeleteOnTermination\":false,\"SnapshotId\":\"snap-0d5ebc3a4f579e955\",\"VolumeSize\":30,\"VolumeType\":\"gp2\",\"Encrypted\":false}}],\"Description\":\"[Copied ami-b9efc4dc from us-east-2] CRICKET_NV2\",\"EnaSupport\":false,\"Hypervisor\":\"xen\",\"Name\":\"CRICKET_NV2\",\"RootDeviceName\":\"/dev/sda1\",\"RootDeviceType\":\"ebs\",\"Tags\":[],\"VirtualizationType\":\"hvm\",\"CrawledTime\":1575728719038,\"Region\":\"us-east-1\"}",
            "attributes": {
                "ApproximateReceiveCount": "2",
                "SentTimestamp": "1575728976759",
                "SenderId": "AROAR2DJVKUN62A43DPIT:d43cd21e7b924d8c9dc05b122a582d94",
                "ApproximateFirstReceiveTimestamp": "1575755245379"
            },
            "messageAttributes": {},
            "md5OfBody": "ea73c903c9f66ed25439dac74a3cb1cc",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:124775650587:crawled_amis",
            "awsRegion": "us-east-1"
        }
]}
var context = "test"
// exports.handler(event, context);