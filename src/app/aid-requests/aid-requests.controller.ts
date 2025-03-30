import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';

import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/action';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { FilterAidRequestDto } from './dto/filter-aid-request.dto';

@ApiTags('aidrequests')
@Controller('aidrequests')
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all aid requests' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all aid requests.',
  })
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.aidRequestsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new aid request' })
  @ApiResponse({
    status: 201,
    description: 'The aid request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody(
    { type: CreateAidRequestDto }, // Swagger için body tanımı
  ) // Swagger için body tanımı
  @Post()
  async create(
    @Body() createAidRequestDto: CreateAidRequestDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    const aidRequest = await this.aidRequestsService.create(createAidRequestDto, userId);
    return { ...aidRequest, qrCodeUrl: aidRequest.qrCodeUrl };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CheckPolicies((ability) => ability.can(Action.Read, 'AidRequest'))
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to retrieve',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'The ID of the organization to retrieve',
  })
  @Get(':id/:organizationId')
  async findOne(
    @Param('id') id: number,
    @Param('organizationId') organizationId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.aidRequestsService.findOne(id, req.user.id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @CheckPolicies((ability) => ability.can(Action.Update, 'AidRequest'))
  @ApiOperation({ summary: 'Update the status of a specific aid request' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the status of the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to update',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'The new status of the aid request',
        },
        userId: {
          type: 'string',
          description: 'The ID of the user',
        },
        userRole: {
          type: 'string',
          description: 'The role of the user',
        },
      },
    },
  })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
    @Body('userId') userId: string, // Ensure userId is a string
    @Body('userRole') userRole: string,
  ) {
    return this.aidRequestsService.updateStatus(id, status, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a specific aid request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully added comment to the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to add comment',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content of the comment',
        },
      },
    },
  })
  @Post(':id/comments')
  async addComment(@Param('id') id: number, @Body('content') content: string) {
    return this.aidRequestsService.addComment(id, content);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a document to a specific aid request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully uploaded document to the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to upload document',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentName: {
          type: 'string',
          description: 'The name of the document',
        },
        documentUrl: {
          type: 'string',
          description: 'The URL of the document',
        },
      },
    },
  })
  @Post(':id/documents')
  async uploadDocument(
    @Param('id') id: number,
    @Body('documentName') documentName: string,
    @Body('documentUrl') documentUrl: string,
  ) {
    return this.aidRequestsService.uploadDocument(
      id,
      documentName,
      documentUrl,
    );
  }

  //delete methodu eklendi
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to delete',
  })
  @Roles(Role.Admin)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'AidRequest'))
  @Patch(':id/delete')
  async delete(@Param('id') id: number) {
    return this.aidRequestsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger aid requests based on extreme weather conditions' })
  @ApiResponse({
    status: 200,
    description: 'Successfully triggered aid requests based on weather conditions.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({
    name: 'latitude',
    description: 'The latitude of the location',
  })
  @ApiParam({
    name: 'longitude',
    description: 'The longitude of the location',
  })
  @Post('trigger-weather/:latitude/:longitude')
  async triggerAidRequestsBasedOnWeather(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
  ) {
    return this.aidRequestsService.triggerAidRequestsBasedOnWeather(latitude, longitude);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify an aid request' })
  @ApiResponse({
    status: 200,
    description: 'Successfully verified the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to verify',
  })
  @Patch(':id/verify')
  async verifyAidRequest(@Param('id') id: number) {
    return this.aidRequestsService.verifyAidRequest(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a suspicious aid request' })
  @ApiResponse({
    status: 200,
    description: 'Successfully reported the suspicious aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to report',
  })
  @Patch(':id/report')
  async reportSuspiciousAidRequest(@Param('id') id: number) {
    return this.aidRequestsService.reportSuspiciousAidRequest(id);
  }

  @Post('verify-delivery')
  async verifyAidDelivery(@Body() body: { qrCodeData: string, status?: string }) {
    return this.aidRequestsService.verifyAidDeliveryByQRCode(
      body.qrCodeData,
      body.status || 'Delivered'
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search aid requests with filters' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved filtered aid requests.',
  })
  @Post('search')
  async searchAidRequests(@Body() filterDto: FilterAidRequestDto) {
    return this.aidRequestsService.searchAidRequests(filterDto);
  }
}
