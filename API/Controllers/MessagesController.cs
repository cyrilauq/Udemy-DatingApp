using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUsername();
        var recipientUsername = createMessageDto.RecipientUsername.ToLower();

        if(username == recipientUsername)
        {
            return BadRequest("You can't send a message to yourself");
        }

        var sender = await userRepository.GetUserByUsernameAsync(username);
        var recipient = await userRepository.GetUserByUsernameAsync(recipientUsername);

        if(recipient == null || sender == null) return BadRequest("Can' send a message at this time");
        
        var message = CreateMessageFrom(sender, recipient, createMessageDto);
        messageRepository.AddMessage(message);

        return await messageRepository.SaveAllAsync() ? Ok(mapper.Map<MessageDto>(message)) : BadRequest("Failed to save message");
    }

    private Message CreateMessageFrom(AppUser sender, AppUser recipient, CreateMessageDto createMessageDto)
    {
        return new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUsername();

        var messages = await messageRepository.GetMessagesForUser(messageParams);

        Response.AddPaginationHeader(messages);

        return messages;
    }
}
