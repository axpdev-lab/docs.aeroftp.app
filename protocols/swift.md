---
title: OpenStack Swift
description: OpenStack Swift in AeroFTP, the object-storage API from Rackspace and the OpenStack project.
---

# OpenStack Swift

> Swift is the object-storage API in OpenStack: an HTTP API for objects stored in containers. An account holds containers, and a container holds objects. The service came from Rackspace Cloud Files. Rackspace released it with NASA as one of the two original OpenStack projects, at OpenStack Austin in October 2010. AeroFTP speaks it as its own transport, next to S3 and Azure Blob. The usual preset is [Blomp](/providers/blomp).
>
> The client authenticates to Keystone, or to the older TempAuth, and receives a storage URL plus a token. Listing, upload, and download are ordinary HTTP calls to that URL. If the login used HTTPS, a catalog entry that points the storage host at plain HTTP is refused, because that URL would carry the account token. Blomp's preset is the declared exception to that rule, since v4.1.8.

Swift is not S3. A service that also offers an S3 gateway is still configured as [S3](/protocols/s3) when you use that gateway, and as Swift when you use this API.

AeroFTP does not ask the server for a content checksum over Swift. The [checksum table](/protocols/checksums) leaves that row empty on purpose.
