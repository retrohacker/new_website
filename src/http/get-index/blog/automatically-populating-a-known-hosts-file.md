@title|Automatically Populating a known_hosts File
@created|20150928

You are probably here because you are trying to automate a service over ssh and you need to get past this prompt:

```
The authenticity of host '[REDACTED]' can't be established.
ECDSA key fingerprint is [REDACTED].
Are you sure you want to continue connecting (yes/no)?
```

# TL;DR

Use the following bash script.

```
for address in $ADDRESSES; do
  ssh-keygen -F $address 2>/dev/null 1>/dev/null
  if [ $? -eq 0 ]; then
    echo “$address is already known”
    continue
  fi
  ssh-keyscan -t rsa -T 10 $address >> ~/.ssh/known_hosts
done
```

Where `$ADDRESSES` is a list of hostnames or IP addresses.

# The long version

So you are automating some service that needs to communicate over ssh. Why not just ignore this warning and press on with your day?

Well, for starters, you have probably found that it can be rather difficult to bypass this warning depending on the tool you are using. More importantly, this prompt is giving you the opportunity to recognize a remote server as “trusted” for future use. This trusted state can protect you from [man-in-the-middle attacks](https://www.wikiwand.com/en/Man-in-the-middle_attack) in the future.

How? Well, assuming this remote host is the right host the first time you try to communicate with it, no future host can imitate it later on down the road after you answer “yes” to that prompt.

This is accomplished by taking the server’s unique identifier and storing it in a known_hosts file on your server. When we later attempt to connect to the server, we take the provided identifier and compare it to the one we know to belong to the host. Assuming they match, we know it is the same machine.

What that fancy bash script above does is use the ssh-keyscan utility to check if a host already exists in your known_hosts file. If not, it gets the identifier using ssh-keyscan.

Some solutions you may find online suggest using the following command in place of the first 5 in the above for loop:

```
ssh-keygen -R $address
```

This sacrifices all of the benefits we get from the known_hosts file in favor of convenience. The -R flag removes a current entry in the known_hosts file, effectively updating the unique identifier for the host everytime the script is run.

This may seem harmless but refer back to our man-in-the-middle attack scenario. By updating the unique identifier, we are giving an attacker the opportunity to replace a legitimate server’s identifier with their own before we connect.
