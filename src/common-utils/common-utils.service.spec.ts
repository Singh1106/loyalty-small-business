import { Test, TestingModule } from '@nestjs/testing';
import { CommonUtilsService } from './common-utils.service';

describe('CommonUtilsService', () => {
  let service: CommonUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonUtilsService],
    }).compile();

    service = module.get<CommonUtilsService>(CommonUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
