using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MessagesController(IUnitOfWork unitOfWork, IMapper mapper) : BaseApiController
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

        var sender = await unitOfWork.UserRepository.GetUserByUsernameAsync(username);
        var recipient = await unitOfWork.UserRepository.GetUserByUsernameAsync(recipientUsername);

        if(recipient == null || sender == null || recipient.UserName == null || sender.UserName == null) return BadRequest("Can' send a message at this time");
        
        var message = CreateMessageFrom(sender, recipient, createMessageDto);
        unitOfWork.MessageRepository.AddMessage(message);

        return await unitOfWork.CompleteAsync() ? Ok(mapper.Map<MessageDto>(message)) : BadRequest("Failed to save message");
    }

    private Message CreateMessageFrom(AppUser sender, AppUser recipient, CreateMessageDto createMessageDto)
    {
        return new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName!,
            RecipientUsername = recipient.UserName!,
            Content = createMessageDto.Content
        };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUsername();

        var messages = await unitOfWork.MessageRepository.GetMessagesForUser(messageParams);

        Response.AddPaginationHeader(messages);

        return messages;
    }

    [HttpGet("thread/{username}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    {
        var currentUsername = User.GetUsername();

        return Ok(await unitOfWork.MessageRepository.GetMessageThread(currentUsername, username));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var username = User.GetUsername();

        var message = await unitOfWork.MessageRepository.GetMessage(id);

        if(message == null) return BadRequest("Cannot delete this message");

        if(message.SenderUsername != username && message.RecipientUsername != username) return Forbid("User is not allowed to delete the message");

        if(message.SenderUsername == username) message.SenderDeleted = true;
        else message.RecipienDeleted = true;

        if (message is { SenderDeleted: true, RecipienDeleted: true }) unitOfWork.MessageRepository.DeleteMessage(message);

        return await unitOfWork.CompleteAsync() ? Ok() : BadRequest("Problem deleting the message");
    }
}
