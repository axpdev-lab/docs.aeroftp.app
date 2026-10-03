FROM alpine:3.19

RUN apk add --no-cache openssh bash \
    && ssh-keygen -A

# Create test users
RUN adduser -D -s /bin/sh user_pwd \
    && echo "user_pwd:password123" | chpasswd \
    && adduser -D -s /bin/sh user_key \
    && passwd -u user_key \
    && adduser -D -s /bin/sh user_mixed \
    && echo "user_mixed:password123" | chpasswd

# Setup home directories
RUN mkdir -p /home/user_pwd/.ssh /home/user_key/.ssh /home/user_mixed/.ssh \
    && chown -R user_pwd:user_pwd /home/user_pwd \
    && chown -R user_key:user_key /home/user_key \
    && chown -R user_mixed:user_mixed /home/user_mixed \
    && chmod 700 /home/user_pwd/.ssh /home/user_key/.ssh /home/user_mixed/.ssh

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh

EXPOSE 22

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
