[19:05:04] StringSelectMenuInteraction {
  type: 3,
  id: '1137431074142695474',
  applicationId: '1081345422834012240',
  channelId: '1136979186389622864',
  guildId: null,
  user: User {
    id: '659689990132858880',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 4194432 },
    username: 'mytic2330',
    globalName: 'Mytic',
    discriminator: '0',
    avatar: 'f65a9ef3f5af00812b9f2af10499dc40',
    banner: undefined,
    accentColor: undefined,
    avatarDecoration: null
  },
  member: null,
  version: 1,
  appPermissions: null,
  memberPermissions: null,
  locale: 'en-US',
  guildLocale: null,
  message: <ref *1> Message {
    channelId: '1136979186389622864',
    guildId: null,
    id: '1137430034097918063',
    createdTimestamp: 1691254852557,
    type: 0,
    system: false,
    content: '',
    author: ClientUser {
      id: '1081345422834012240',
      bot: true,
      system: false,
      flags: [UserFlagsBitField],
      username: 'BlueCity-modmail',
      globalName: null,
      discriminator: '6071',
      avatar: '2579e64af859d6753f88dbcc80769c70',
      banner: undefined,
      accentColor: undefined,
      avatarDecoration: null,
      verified: true,
      mfaEnabled: true
    },
    pinned: false,
    tts: false,
    nonce: null,
    embeds: [ [Embed] ],
    components: [ [ActionRow] ],
    attachments: Collection(0) [Map] {},
    stickers: Collection(0) [Map] {},
    position: null,
    roleSubscriptionData: null,
    editedTimestamp: null,
    reactions: ReactionManager { message: [Circular *1] },
    mentions: MessageMentions {
      everyone: false,
      users: Collection(0) [Map] {},
      roles: Collection(0) [Map] {},
      _members: null,
      _channels: null,
      _parsedUsers: null,
      crosspostedChannels: Collection(0) [Map] {},
      repliedUser: null
    },
    webhookId: null,
    groupActivityApplication: null,
    applicationId: null,
    activity: null,
    flags: MessageFlagsBitField { bitfield: 0 },
    reference: null,
    interaction: null
  },
  customId: 'starter',
  componentType: 3,
  deferred: false,
  ephemeral: null,
  replied: false,
  webhook: InteractionWebhook { id: '1081345422834012240' },
  values: [ 'pomoc' ]
}

			if (await client.ticket.has(interaction.user.id) === true) {
				const embed = new EmbedBuilder()
					.setColor(await client.db.get('color'))
					.setTitle('Prosimo počakajte preden odprete nov ticket!')
					.setTimestamp();
				await interaction.editReply({ embeds: [embed] });
				await client.ticket.delete(interaction.user.id);
				return;
			}